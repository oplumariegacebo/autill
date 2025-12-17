import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePurchaserModalComponent } from './generate-purchaser-modal.component';

describe('GeneratePurchaserModalComponent', () => {
  let component: GeneratePurchaserModalComponent;
  let fixture: ComponentFixture<GeneratePurchaserModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratePurchaserModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratePurchaserModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
