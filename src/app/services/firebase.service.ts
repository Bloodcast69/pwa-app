import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  items: AngularFirestoreCollection<any>;

  constructor(private db: AngularFirestore) {
    this.items = db.collection<any>('Items');
  }

  addItem(item: any) {
    this.items.add(item);
  }

  getData() {
    return this.items;
  }
}
