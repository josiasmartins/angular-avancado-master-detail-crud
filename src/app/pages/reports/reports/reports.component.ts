import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Category } from '../../categories/shared/category.model';
import currentFormatter from 'currency-formatter';
import { Entry } from '../../entries/shared/entry.model';
import { EntryService } from '../../entries/shared/entry.service';
import { CategoryService } from '../../categories/shared/category.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  expenseTotal: any = 0;
  revenueTotal: any = 0;
  balance: any = 0;

  expenseCharData: any;
  revenueCharData: any;

  charOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  categories: Category[] = [];
  entries: Entry[] = [];

  @ViewChild('month') month: ElementRef = null;
  @ViewChild('year') year: ElementRef = null;

  constructor(
    private entryService: EntryService,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.categoryService.getAll()
      .subscribe(categories => this.categories = categories);
  }

  public generateReports() {
    const month = this.month.nativeElement.value;
    const year = this.year.nativeElement.value;

    if (!month || !year)
      alert("Você precisa selecionar o Mês e o Ano para gear os relatórios")
    else
      this.entryService.getByMonthAndYear(month, year).subscribe(this.setValues.bind(this))
  }

  private setValues(entries: Entry[]) {
    this.entries = entries;
    this.calculateBalance();
    this.setChartData();
  }

  private calculateBalance() {
    let expenseTotal = 0;
    let revenueTotal = 0;

    this.entries.forEach(entry => {
      if (entry.type === 'revenue')
        revenueTotal += currentFormatter.unformat(entry.amount, { code: 'BRL' })
      else
        expenseTotal += currentFormatter.unformat(entry.amount, { code: 'BRL' })
    });

    this.expenseTotal = currentFormatter.format(expenseTotal, { code: 'BRL' });
    this.revenueTotal = currentFormatter.format(revenueTotal, { code: 'BRL' });
    this.balance = currentFormatter.format(revenueTotal - expenseTotal, { code: 'BRL' });
  }

  private setChartData() {
    this.revenueCharData = this.getChartData('revenue', 'Gráfico de Receitas', '#9ccc65');
    this.expenseCharData = this.getChartData('revenue', 'Gráfico de Despesas', '#e03131');
  }

  private getChartData(entryType: string, title: string, color: string) {
    const charData = [];
    this.categories.forEach(category => {
      // filtering entries by category and type
      const filteredEntries = this.entries.filter(
        entry => (entry.categoryId == category.id) && (entry.type == entryType)
      );

      // if found entries, then sum entries amount and add to charData
      if (filteredEntries.length > 0) {
        const totalAmount = filteredEntries.reduce(
          (total, entry) => total + currentFormatter.unformat(entry.amount, { code: 'BRL' }), 0
        )

        charData.push({
          categoryName: category.name,
          totalAmount: totalAmount
        })
      }
    })

    return {
      labels: charData.map(item => item.categoryName),
      datasets: [{
        label: title,
        backgroundColor: color,
        data: charData.map(item => item.totalAmount)
      }]
    }
  }

}
