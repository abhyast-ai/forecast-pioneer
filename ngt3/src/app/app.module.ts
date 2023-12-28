import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormulasComponent } from './components/formulas/formulas.component';
import { DatasheetComponent } from './components/datasheet/datasheet.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FormulasComponent,
    DatasheetComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 1000, // Time to close the notification (milliseconds)
      positionClass: 'toast-top-right', // Position of the notifications
      preventDuplicates: true, // Prevent duplicate notifications
      closeButton: true, // Show close button
      progressBar: true, // Show a progress bar
      // Other options...
    }),
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
