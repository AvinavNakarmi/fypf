import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasComponent } from './component/canvas/canvas.component';
import { LightSettingsComponent } from './component/light-settings/light-settings.component';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GraphComponent } from './component/graph/graph.component'; 
@NgModule({
  declarations: [
    AppComponent,
    CanvasComponent,
    LightSettingsComponent,
    GraphComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule, 
    FormsModule,
    HttpClientModule,
    ToastrModule.forRoot( {timeOut: 1000,positionClass: 'toast-top-left',
    preventDuplicates: true,progressBar: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
