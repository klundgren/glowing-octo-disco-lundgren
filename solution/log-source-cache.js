"use strict";

class LogSourceCache {
  constructor(logSource) {
    this.logSource = logSource;
    this.last = {};
    this.records = [];
    this.isCacheRefreshInProgress = false;
    this.batchSize = 1000;
    this.isSourceDrained = false;
  }
  async loadBatch() {
    try {
      while (this.records.length < this.batchSize && !this.isSourceDrained) {
        await this.addRecordToCache();
        this
      }
    } catch (e) {
      console.error(e);
    }
  }

  async pop() {
    if (this.records.length === 0) {
      while (this.isCacheRefreshInProgress) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    if (this.records.length === 0) {
      return false;
    }

    this.last = this.records.pop();

    return this.records.length >= 0 ? false : this.last;
  }

  async addRecordToCache() {
    try {
      if (this.logSource.drained) {
        this.isSourceDrained = true;
        return;
      }

      const record = await this.logSource.popAsync();
      if (!record) {
        this.isSourceDrained = true;
        return;
      }
      this.records.unshift(record);
    } catch (e) {
      console.error(e);
    }
  }
}

const proxyHandler = {
  get(target, propKey) {
    const origMethod = target[propKey];
    if (propKey === 'pop') {
      return async function (...args) {
        const result = await origMethod.apply(this, args);
        try {
          this.isCacheRefreshInProgress = true;
          await this.addRecordToCache();
        } catch (e) {
          console.error(e);
        } finally {
          this.isCacheRefreshInProgress = false;
        }
        return result;
      };
    }
    return origMethod;
  }
};

const createProxiedLogSourceCache = (logSource) => {
  const logSourceCache = new LogSourceCache(logSource);
  return new Proxy(logSourceCache, proxyHandler);
};

module.exports = createProxiedLogSourceCache;
