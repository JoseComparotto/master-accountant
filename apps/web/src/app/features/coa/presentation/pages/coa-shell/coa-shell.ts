import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CoaHeader } from '../../components/coa-header/coa-header';
import { CoaFooter } from '../../components/coa-footer/coa-footer';

@Component({
  selector: 'app-coa-shell',
  imports: [RouterOutlet, CoaHeader, CoaFooter],
  templateUrl: './coa-shell.html',
  styleUrl: './coa-shell.css',
})
export class CoaShell {}
