import { Component, inject, Input, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { DeleteItemModalComponent } from '../../../shared/components/delete-item-modal/delete-item-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { ItemModalComponent } from '../../../shared/components/item-modal/item-modal.component';
import { ErrorsComponent } from '../../../shared/components/errors/errors.component';
import { ItemService } from '../../services/item.service';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { SearchFiltersComponent } from '../../../shared/components/search-filters/search-filters.component';
import { CommonService, Messages } from '../../services/common-service.service';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [ErrorsComponent, PaginatorComponent, SearchFiltersComponent],
  templateUrl: './items.component.html',
  styleUrl: './items.component.css'
})
export class ItemsComponent {
  @Input() items: any;

  dataScreen: string = 'items'
  dataItems: any = [];
  showModal = false;
  itemService = inject(ItemService);
  commonService = inject(CommonService);
  errorMessage: string = '';
  allItems: any = [];
  filtersActivated: any = null;

  displayedColumns: string[] = ['name', 'price', 'actions'];

  constructor(private dialog: MatDialog){}

  ngOnInit() {
    this.itemService.getItems(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((items:any) => {
      this.allItems = items;
      this.dataItems = items;
      this.items = items;
    })
  }

  openTaskDialog(action:string, item: Object) {
    const dialogRef = this.dialog.open(ItemModalComponent);
    dialogRef.componentInstance.item = item;

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // do something
      }
    });
  }

  updateItems(pagination: any){
    this.itemService.getItems(localStorage.getItem('id') || "[]", null, 10, pagination.skip).subscribe((items:any) => {
      this.allItems = items;
      this.dataItems = items;
      this.items = items;
    })
  }

  updateSearching(formControlValue: any){
    if(formControlValue === ""){
      this.filtersActivated = null;
      this.itemService.getItems(localStorage.getItem('id') || "[]", null, 10, 0).subscribe((items:any) => {
        this.allItems = items;
        this.dataItems = items;
        this.items = items;
      })
    }else{
      this.filtersActivated  = formControlValue;
      this.itemService.getItems(localStorage.getItem('id') || "[]", formControlValue, 10, 0).subscribe((filterItems: any) => {
        this.items = filterItems;
        this.allItems = this.items;
      });
    }
  }

  deleteItem(id:number){
    const dialogRef = this.dialog.open(DeleteItemModalComponent);
    dialogRef.componentInstance.type = 'producto';
    dialogRef.componentInstance.title = Messages.DELETE_ITEM_TITLE;
    dialogRef.componentInstance.message = Messages.DELETE_ITEM_MSG;
    dialogRef.componentInstance.id = id;

    dialogRef.afterClosed().subscribe(result => {
    })
  }
}
