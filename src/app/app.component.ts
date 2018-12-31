import {Component, OnInit, ViewChild} from '@angular/core';
import {IdbService} from './services/idb.service';
import {FormControl} from '@angular/forms';
import {ModalDirective} from 'angular-bootstrap-md';
import {FirebaseService} from './services/firebase.service';
import {Observable, of} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(ModalDirective) modal: ModalDirective;

  nameInput = new FormControl();
  timeInput = new FormControl();
  descriptionInput = new FormControl();
  instructorInput = new FormControl();

  items$: Observable<any>;
  online = true;

  constructor(
    private idbService: IdbService,
    private firebase: FirebaseService,
    private db: AngularFirestore) {
    this.online = navigator.onLine;
    this.idbService.connectToIDB();
    let onlineDataLength;
    this.idbService.getAllData('Items').then((items: any) => {
      onlineDataLength = items.length;
      if (navigator.onLine && onlineDataLength === 0) {
        this.items$ = this.db.collection('Items', item => item.orderBy('time', 'asc')).snapshotChanges().pipe(map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as any;
            this.idbService.addItems('Items', data);
            return {...data};
          });
        }));
      } else {
        this.items$ = of(items);
      }

      this.idbService.dataChanged().subscribe((data: any) => {
        this.items$ = of(data);
        console.log(this.items$);
      });
    });
  }

  addNewItem() {
    const value = {
      id: null,
      name: this.nameInput.value,
      time: this.timeInput.value,
      description: this.descriptionInput.value,
      instructor: this.instructorInput.value
    };

    if (!(navigator.onLine)) {
      this.idbService.addItems('Sync-Items', value);
      this.idbService.addItems('Items', value);
    } else if (navigator.onLine) {
      this.idbService.addItems('Items', value);
      this.idbService.getAllData('Items').then((data: any) => {
        this.firebase.addItem({
          id: data.length,
          name: value.name,
          time: value.time,
          description: value.description,
          instructor: value.instructor
        });
      });
    }

    this.nameInput.setValue('');
    this.timeInput.setValue('');
    this.descriptionInput.setValue('');
    this.instructorInput.setValue('');

    this.modal.hide();
  }

  getOnlineData() {
    return this.idbService.getAllData('Items');
  }

  getOfflineData() {
    return this.idbService.getAllData('Sync-Items');
  }

  mergeDatabases() {
    let offline;
    let online;

    this.getOfflineData().then((data: any) => {
      offline = data;
    });
    this.getOnlineData().then((data: any) => {
      online = data;
      offline.forEach((el: any, index: number) => {
        if (el == offline[index]) {
          this.firebase.addItem(el);
          this.idbService.addItems('Items', el);
          this.idbService.deleteItems('Sync-Items', el.id);
        }
      });
    });
  }


  ngOnInit() {
    if (navigator.onLine) {
      this.mergeDatabases();
    }
  }

}
