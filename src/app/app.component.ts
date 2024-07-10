import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeatmapService } from './app.service';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  myForm!: FormGroup;
  heatmapData: { date: string; count: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private heatmapService: HeatmapService
  ) {}

  ngOnInit() {
    this.myForm = this.fb.group({
      date: ['', Validators.required],
      inputField: ['', Validators.required],
    });
    this.generateCommitData();
  }

  private generateCommitData() {
    // const startDate = new Date('2024-01-01');
    // const endDate = new Date('2024-12-31');
    // for (
    //   let d = new Date(startDate);
    //   d <= endDate;
    //   d.setDate(d.getDate() + 1)
    // ) {
    //   this.heatmapData.push({
    //     date: d.toISOString().split('T')[0],
    //     count: Math.floor(Math.random() * 20),
    //   });
    // }
    this.heatmapService.getStaticData().subscribe(
      (data) => {
        this.heatmapData = data;
      },
      (error) => {
        console.error('There was an error!', error);
      }
    );
  }

  onSubmit() {
    if (this.myForm.valid) {
      this.heatmapData.push({
        date: this.myForm.value.date.toISOString().split('T')[0],
        count: this.myForm.value.inputField,
      });
      this.myForm.reset();
    } else {
      console.log('Form is not valid');
    }
  }
}
