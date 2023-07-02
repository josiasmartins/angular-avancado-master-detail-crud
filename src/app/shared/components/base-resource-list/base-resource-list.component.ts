import { OnInit } from '@angular/core';

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

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

  deleteEntry(resource: T) {
    const mustDelete = confirm("Deseja realmente excluir este item");

    if (mustDelete) {
      this.resourceService.delete(resource.id).subscribe(
        () => this.resources = this.resources.filter(element => element != resource),
        () => alert("Erro ao tentar excluir!")
      )
    }

  }

}
