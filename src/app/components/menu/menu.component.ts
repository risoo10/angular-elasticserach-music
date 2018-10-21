import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {debounceTime} from 'rxjs/internal/operators';

@Component({
  selector: 'esm-menu',
  templateUrl: 'menu.component.html',
  styleUrls: ['menu.component.scss']
})

export class MenuComponent implements OnInit {

  @Input() initialValue = '';
  @Input() placeholder = 'Search';
  @Output() search = new EventEmitter<string>();


  searchControl: FormControl;

  constructor() {
  }

  ngOnInit() {
    this.searchControl = new FormControl();

    // On changes
    this.searchControl.valueChanges.pipe(debounceTime(200))
      .subscribe(() => this.search.emit(this.searchControl.value));

    // Init search value
    this.searchControl.setValue(this.initialValue);
  }
}
