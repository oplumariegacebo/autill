import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Pages {
  page: number;
  initialElement: number;
  finalElement: number;
}

const PAGINATION: Pages[] = [
  {page: 1, initialElement: 0, finalElement: 10,},
  {page: 2, initialElement: 10, finalElement: 20},
  {page: 3, initialElement: 20, finalElement: 30},
  {page: 4, initialElement: 30, finalElement: 40},
  {page: 5, initialElement: 40, finalElement: 50},
  {page: 6, initialElement: 50, finalElement: 60},
  {page: 7, initialElement: 60, finalElement: 70},
  {page: 8, initialElement: 70, finalElement: 80},
  {page: 9, initialElement: 80, finalElement: 90},
  {page: 10, initialElement: 90, finalElement: 100},
  {page: 11, initialElement: 100, finalElement: 110},
  {page: 12, initialElement: 110, finalElement: 120},
  {page: 13, initialElement: 120, finalElement: 130},
  {page: 14, initialElement: 130, finalElement: 140},
  {page: 15, initialElement: 140, finalElement: 150}
];

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css'
})
export class PaginatorComponent {

  @Input() allItems: any;
  @Output() updateItems = new EventEmitter<any>();

  modelPagination:any = PAGINATION;
  pageSize = 10;
  actualPage = 1;
  nPage: boolean = true;
  pPage: boolean = false;

  ngOnInit() {
    this.nPage = true;
    this.pPage = false;
    if(this.allItems.page.finalElement >= this.allItems.count) {
      this.allItems.page.finalElement = this.allItems.count;
      this.nPage = false;
      this.pPage = true;
      if(this.allItems.count <= 10){
        this.pPage = false;
      }
    }
  }

  ngOnChanges(){
    this.ngOnInit();
  }

  nextPage(actualPage: number){
    this.pPage = true;
    this.actualPage = actualPage+1;
    if(this.pageSize*this.actualPage > this.allItems.count){
      this.nPage = false;
    }
    this.updateItems.emit({"take": 10, "skip": this.modelPagination[actualPage].initialElement});
  }

  previousPage(actualPage: number){
    this.nPage = true;
    this.actualPage = actualPage -1;

    if(this.actualPage === 1){
      this.pPage = false;
    }

    if(this.pageSize*this.actualPage > this.allItems.count){
      this.pPage = false;
    }
    this.updateItems.emit({"take": 10, "skip": this.modelPagination[this.actualPage-1].initialElement}); 
  }

}
