import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './searchBar.html',
  styleUrl: './searchBar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar { }
