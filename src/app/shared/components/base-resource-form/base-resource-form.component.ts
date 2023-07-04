import { AfterContentChecked, Injector, OnInit, Directive } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/Operators';
import toastr from 'toastr';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: 'edit' | 'new';
  resourceForm: FormGroup;
  pageTitle: string;
  serverErrorMessages: string[] = null;
  submittingForm: boolean = false;

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    protected injector: Injector,
    public resource: T,
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T
  ) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  ngOnInit() {
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(): void {
    this.setPageTitle();
  }

  submitForm() {
    this.submittingForm = true;

    if (this.currentAction == 'new')
      this.createResource();
    else
      this.updateResource();
  }

  // PRIVATE METHODS
  protected setCurrentAction() {
    if (this.route.snapshot.url[0].path == 'new')
      this.currentAction = 'new'
    else
      this.currentAction = 'edit';
  }

  // private buildResourceForm() {
  //   this.categoryForm = this.formBuilder.group({
  //     id: [null],
  //     name: [null, [Validators.required, Validators.minLength(2)]],
  //     description: [null]
  //   });
  // }

  protected loadResource() {
    if (this.currentAction == 'edit') {

      this.route.paramMap.pipe(
        switchMap(param => this.resourceService.getById(+param.get("id"))) // +param.get("id") converte em numero
      )
      .subscribe(
        (resource) => {
          this.resource = resource;
          this.resourceForm.patchValue(resource); // binds loaded resource data to Resource
        },
        (error) => alert("Ocorreu um erro no servidor, tente mais tarde")
      )
    }
  }

  private setPageTitle() {
    if (this.currentAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else {
      // const categoryName = this.category.name || '';
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string {
    return 'Novo';
  }

  protected editionPageTitle(): string {
    return 'Edição'
  }

  protected createResource() {
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    console.log(resource.id, resource);

    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      );
  }

  protected updateResource() {
    // console.log(this.categoryForm.value);
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
    console.log(resource.id, 'ibg');

    this.resourceService.update(resource).subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }

  private actionsForSuccess(resource: T) {
    console.log(resource.id)
    toastr.success("Solicitação processsada com sucesso!");

    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

    // redirect/reload component page
    this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true }).then(
      () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
    );
  }

  private actionsForError(error) {
    toastr.error("Ocorreu um erro ao processar a sua solicitação");

    this.submittingForm = false;

    if (error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ['Falha na comunicação com o servidor. Por favor, tente mais tarde.'];
  }

  protected abstract buildResourceForm(): void;

}
