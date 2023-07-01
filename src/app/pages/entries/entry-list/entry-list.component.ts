import { Component, OnInit } from '@angular/core';
import { Entry } from '../shared/entry.model';
import { HttpClient } from '@angular/common/http';
import { EntryService } from '../shared/entry.service';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[] = [];

  constructor(
    private entryService: EntryService
  ) { }

  ngOnInit() {
    this.entryService.getAll().subscribe(
      entries => {console.log(entries);this.entries = entries.sort((a, b) => b.id - a.id)},
      error => alert("erro ao carregar a lista")
    );
    console.log(this.entries)
  }

  deleteEntry(entry) {
    const mustDelete = confirm("Deseja realmente excluir este item");

    if (mustDelete) {
      this.entryService.delete(entry.id).subscribe(
        () => this.entries = this.entries.filter(element => element != entry),
        () => alert("Erro ao tentar excluir!")
      )
    }

  }

}
