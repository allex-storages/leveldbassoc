function createLevelDBAssocStorage (execlib, leveldblib, datalib, leveldbstoragehelperslib) {
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    AssociativeStorageBase = datalib.AssociativeStorageBase,
    AsyncStorageMixin = datalib.AsyncStorageMixin,
    LevelDBStorageMixin = leveldbstoragehelperslib.Mixin,
    LevelDBHandler = leveldblib.LevelDBHandler;

  function StorageLevelDBHandler (prophash) {
    LevelDBHandler.call(this, prophash);
  }
  lib.inherit(StorageLevelDBHandler, LevelDBHandler);
  StorageLevelDBHandler.prototype.getFromStorage = function (key) {
    return LevelDBHandler.prototype.safeGet.call(this, key, null);
  };
  StorageLevelDBHandler.prototype.replace = function (key, val) {
    return this.getFromStorage(key).then(
      this.onGetOfReplace.bind(this, key, val)
    );
  };
  StorageLevelDBHandler.prototype.onGetOfReplace = function (key, val, origval)  {
    return this.put(key, val).then(
      qlib.returner(origval)
    );
  };

  function LevelDBAssocStorage (prophash) {
    LevelDBStorageMixin.call(this, prophash);
    AsyncStorageMixin.call(this, prophash);
    AssociativeStorageBase.call(this, prophash);
  }
  lib.inherit(LevelDBAssocStorage, AssociativeStorageBase);
  AsyncStorageMixin.addMethods(LevelDBAssocStorage, AssociativeStorageBase);
  LevelDBStorageMixin.addMethods(LevelDBAssocStorage);
  LevelDBAssocStorage.prototype.destroy = function () {
    AssociativeStorageBase.prototype.destroy.call(this);
    AsyncStorageMixin.prototype.destroy.call(this);
    LevelDBStorageMixin.prototype.destroy.call(this);
  };
  LevelDBAssocStorage.prototype._createData = function () {
    return new StorageLevelDBHandler(this.createEncodingAndReturnPropertyHash('json'));
  };
  LevelDBAssocStorage.prototype.baseFinalizeUpdateOnItem = function (item, defer) {
    AssociativeStorageBase.prototype.finalizeUpdateOnItem.call(this, item, defer);
    return q(true);
  };
  LevelDBAssocStorage.prototype.getMethodName = 'getFromStorage';
  LevelDBAssocStorage.prototype.addMethodName = 'put';
  LevelDBAssocStorage.prototype.replaceMethodName = 'replace';
  LevelDBAssocStorage.prototype.removeMethodName = 'del';

  return LevelDBAssocStorage;
}

module.exports = createLevelDBAssocStorage;
