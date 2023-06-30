import { AfterContentChecked, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';
import { switchMap } from 'rxjs/Operators';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: 'edit' | 'new';
  categoryForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  // PRIVATE METHODS
  private setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new')
      this.currentAction = 'new'
    else
      this.currentAction = 'edit';
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null],
      descritpion: [null]
    });
  }

  private loadCategory() {
    if (this.currentAction == 'edit') {

      this.route.paramMap.pipe(
        switchMap(param => this.categoryService.getById(+param.get("id"))) // +param.get("id") converte em numero
      )
      .subscribe(
        (category) => {
          this.category = category;
          this.categoryForm.patchValue(category); // binds loaded category data to Category
        },
        (error) => alert("Ocorreu um erro no servidor, tente mais tarde")
      )
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = 'Cadastro de nova Categoria';
    else {
      const categoryName = this.category.name || '';
      this.pageTitle = `Editando Categoria ${categoryName}`;
    }
  }

}
