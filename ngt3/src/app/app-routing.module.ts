import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormulasComponent } from './components/formulas/formulas.component';
import { DatasheetComponent } from './components/datasheet/datasheet.component';

const routes: Routes = [
  {path:'',component:DashboardComponent},
  {path:'formula',component:FormulasComponent},
  {path:'sheet',component:DatasheetComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
