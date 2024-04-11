import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasComponent } from './component/canvas/canvas.component';
import { GraphComponent } from './component/graph/graph.component';
import { LightSettingsComponent } from './component/light-settings/light-settings.component';
import { OptionsComponent } from './component/options/options.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    GraphComponent,
    LightSettingsComponent,
    OptionsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, 
    FormsModule,
    ToastrModule.forRoot( {timeOut: 1000,positionClass: 'toast-top-left',
    preventDuplicates: true,progressBar: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
