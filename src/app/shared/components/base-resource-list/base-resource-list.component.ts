import { OnInit, Directive } from '@angular/core';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

@Directive()
export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  resources: T[] = [];

  constructor(private resourceService: BaseResourceService<T>) { }

  ngOnInit() {
    this.resourceService.getAll().subscribe(
      entries => this.resources = entries.sort((a, b) => b.id - a.id),
      error => alert("erro ao carregar a lista")
    );
    console.log(this.resources);
  }

  deleteResource(resource: T) {
    const mustDelete = this.modalConfirm();

    if (mustDelete) {
      this.resourceService.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(element => element != resource),
        () => alert("Erro ao tentar excluir!")
      )
    }

  }

  protected modalConfirm(): boolean {
    return confirm("Deseja realmente excluir este item")
  }

}
