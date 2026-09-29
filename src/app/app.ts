import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderNav} from './components/header-nav';
import { inject } from '@angular/core';
import { ClinicalDataState } from './services/clinical-data';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderNav],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  clinicalState = inject(ClinicalDataState);
}
