import {Component, ViewChild} from '@angular/core';
import {ModalDirective} from 'angular-bootstrap-md';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import {FirebaseService} from './firebase.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(ModalDirective) modal: ModalDirective;

  nameInput = new FormControl();
  timeInput = new FormControl();
  descriptionInput = new FormControl();
  instructorInput = new FormControl();

  items$: Observable<any>;

  constructor(
    private firebase: FirebaseService,
    private db: AngularFirestore) {
    this.items$ = this.db.collection('Items', item => item.orderBy('time', 'asc')).snapshotChanges().pipe(map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as any;
        return {...data};
      });
    }));
  }
  addNewItem() {
    const value = {
      id: null,
      name: this.nameInput.value,
      time: this.timeInput.value,
      description: this.descriptionInput.value,
      instructor: this.instructorInput.value
    };

    this.firebase.addItem({
      name: value.name,
      time: value.time,
      description: value.description,
      instructor: value.instructor
    });

    this.nameInput.setValue('');
    this.timeInput.setValue('');
    this.descriptionInput.setValue('');
    this.instructorInput.setValue('');

    this.modal.hide();
  }

}
