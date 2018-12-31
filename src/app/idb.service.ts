import {Injectable} from '@angular/core';
import idb from 'idb';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IdbService {
  private _dataChange: Subject<any> = new Subject<any>();
  private _dbPromise;

  constructor() {
  }

  connectToIDB() {
    this._dbPromise = idb.open('pwa-database', 1, UpgradeDB => {
      if (!UpgradeDB.objectStoreNames.contains('Items')) {
        UpgradeDB.createObjectStore('Items', {keyPath: 'id', autoIncrement: true});
      }
      if (!UpgradeDB.objectStoreNames.contains('Sync-Items')) {
        UpgradeDB.createObjectStore('Sync-Items', {keyPath: 'id', autoIncrement: true});
      }
    });
  }

  addItems(target: string, value: any) {
    this._dbPromise.then((db: any) => {
      const tx = db.transaction(target, 'readwrite');
      tx.objectStore(target).put({
        name: value.name,
        time: value.time,
        description: value.description,
        instructor: value.instructor
      });
      this.getAllData('Items').then((items: any) => {
        this._dataChange.next(items);
      });
      return tx.complete;
    });
  }

  deleteItems(target: string, value: any) {
    this._dbPromise.then((db: any) => {
      const tx = db.transaction(target, 'readwrite');
      const store = tx.objectStore(target);
      store.delete(value);
      this.getAllData(target).then((items: any) => {
        this._dataChange.next(items);
      });
      return tx.complete;
    });
  }

  getAllData(target: string) {
    return this._dbPromise.then((db: any) => {
      const tx = db.transaction(target, 'readonly');
      const store = tx.objectStore(target);
      return store.getAll();
    });
  }

  dataChanged(): Observable<any> {
    return this._dataChange;
  }


}
