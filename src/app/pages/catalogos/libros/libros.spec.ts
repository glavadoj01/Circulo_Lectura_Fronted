import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Libros } from './libros';

describe('Libros', () => {
  let component: Libros;
  let fixture: ComponentFixture<Libros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Libros]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Libros);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
