import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {HeaderNav} from './components/header-nav';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, HeaderNav],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}

