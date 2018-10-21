import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumSearchComponent } from './album-search.component';

describe('AlbumSearchComponent', () => {
  let component: AlbumSearchComponent;
  let fixture: ComponentFixture<AlbumSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlbumSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
