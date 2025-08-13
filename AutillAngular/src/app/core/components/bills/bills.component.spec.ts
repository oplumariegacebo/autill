import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsComponent } from './bills.component';

describe('BillsComponent', () => {
  let component: BillsComponent;
  let fixture: ComponentFixture<BillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateItems and update bills', () => {
    const spy = spyOn(component.billService, 'getBills').and.callThrough();
    component.updateItems({ skip: 0 });
    expect(spy).toHaveBeenCalled();
  });

  it('should call cashed and reload', () => {
    const spy = spyOn(component.billService, 'cashed').and.callThrough();
    const reloadSpy = spyOn(window.location, 'reload');
    component.cashed(1);
    expect(spy).toHaveBeenCalledWith(1);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should call updateSearching and update bills', () => {
    const spy = spyOn(component.billService, 'getBills').and.callThrough();
    component.updateSearching({});
    expect(spy).toHaveBeenCalled();
  });

  it('should call deleteBill and remove bill from arrays', () => {
    component.bills = { data: [{ Id: 1 }, { Id: 2 }] };
    component.allBills = { data: [{ Id: 1 }, { Id: 2 }] };
    component.dataBills = { data: [{ Id: 1 }, { Id: 2 }] };
    const dialogRefMock = { afterClosed: () => ({ subscribe: (fn: any) => fn('confirm') }), componentInstance: {} };
    spyOn(component.dialog, 'open').and.returnValue(dialogRefMock as any);
    component.deleteBill(1);
    expect(component.bills.data.length).toBe(1);
    expect(component.allBills.data.length).toBe(1);
    expect(component.dataBills.data.length).toBe(1);
  });
});
