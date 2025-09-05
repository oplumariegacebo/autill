import { Component, inject } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
import { ApiService } from '../../../core/services/api.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SpinnerLoadingComponent } from '../spinner-loading/spinner-loading.component';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [SpinnerLoadingComponent, ReactiveFormsModule],
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.css'
})
export class CategoryModalComponent {
  categoryForm!: FormGroup
  category!: any;
  client: Object = {};
  loading: boolean = false;
  apiService = inject(ApiService);
  categoriesService = inject(CategoryService);

  initializeForm() {
    this.categoryForm = new FormGroup({
      Id: new FormControl(),
      Name: new FormControl(),
      IdBusiness: new FormControl(localStorage.getItem('id') || "[]")
    })
  }

  constructor(public dialogRef: MatDialogRef<CategoryModalComponent>, private formBuilder: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    console.log(this.category);
    if (this.category.Id > 0) {
      this.categoryForm.setValue(this.category);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  updateLivePriceImp($event: Event) {
    const input = $event.target as HTMLInputElement;
    const value = Number(input.value) || 0;

    this.updatePriceImp();
  }

  updatePriceImp() {
    const price = Number(this.categoryForm.get('Price')?.value) || 0;
    const iva = Number(this.categoryForm.get('Iva')?.value) || 0;
    const irpf = Number(this.categoryForm.get('Irpf')?.value) || 0;

    const priceImp = price + (price * iva / 100) - (price * irpf / 100);

    this.categoryForm.controls['PriceImp'].setValue(priceImp.toFixed(2), { emitEvent: false });
  }

  actionClient() {
    this.loading = true;
    if (this.category == 0) {
      this.categoryForm.removeControl('Id');
      const categoryData = this.categoryForm.getRawValue();
      this.categoriesService.addCategory(categoryData).subscribe({
        next: (newCategory) => {
          //this.dialogRef.close(newCategory);
        },
        complete: () => {
          window.location.reload();
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      const categoryData = this.categoryForm.getRawValue();
      this.categoriesService.editCategory(this.category.Id, categoryData).subscribe({
        next: (updatedCategory) => {
          window.location.reload();
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
