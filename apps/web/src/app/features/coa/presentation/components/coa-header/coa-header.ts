import { Component } from '@angular/core';
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideBookOpen } from '@ng-icons/lucide';

@Component({
  selector: 'header[app-coa-header]',
  imports: [NgIcon],
  templateUrl: './coa-header.html',
  styleUrl: './coa-header.css',
  host: {
    class: 'flex items-start justify-between flex-wrap gap-4 mb-6'
  },
  viewProviders: [
    provideIcons({
      lucideBookOpen
    })
  ]
})
export class CoaHeader { }
