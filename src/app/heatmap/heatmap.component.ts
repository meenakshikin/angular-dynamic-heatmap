import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
})
export class HeatmapComponent implements AfterViewInit, OnChanges {
  @Input() data: { date: string; count: number }[] = [];
  @ViewChild('heatmapCanvas', { static: false })
  heatmapCanvas!: ElementRef;
  private ctx!: CanvasRenderingContext2D;
  private width = 800;
  private height = 800;
  private squareSize = 20;
  private padding = 2;

  // Tooltip variables
  tooltipVisible = false;
  tooltipText = '';
  tooltipX = 0;
  tooltipY = 0;

  ngAfterViewInit() {
    this.initializeCanvas();
    this.drawCommitGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && this.ctx) {
      this.drawCommitGraph();
    }
  }

  private initializeCanvas() {
    const canvas = this.heatmapCanvas.nativeElement as HTMLCanvasElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  private drawCommitGraph() {
    this.clearCanvas();
    this.drawAxes();
    const daysInMonth = this.calculateDaysInMonth();
    daysInMonth.forEach((month, monthIndex) => {
      month.forEach((day, dayIndex) => {
        const color = this.calculateColor(day.count);
        this.drawSquare(monthIndex, dayIndex, color, day.date, day.count);
      });
    });
  }

  private clearCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private drawSquare(
    month: number,
    day: number,
    color: string,
    date: string,
    count: number
  ) {
    const x = month * (this.squareSize + this.padding) + this.squareSize;
    const y = day * (this.squareSize + this.padding) + this.squareSize;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.squareSize, this.squareSize);

    // Save data for tooltips
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
    this.ctx.strokeRect(x, y, this.squareSize, this.squareSize);
    (this.ctx as any).date = date;
    (this.ctx as any).count = count;
  }

  private drawAxes() {
    this.ctx.font = '12px Arial';
    this.ctx.fillStyle = '#000';

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      this.ctx.fillText(
        daysOfWeek[i],
        0,
        i * (this.squareSize + this.padding) + this.squareSize * 1.5
      );
    }

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (let i = 0; i < months.length; i++) {
      this.ctx.fillText(
        months[i],
        i * (this.squareSize + this.padding) + this.squareSize,
        10
      );
    }
  }

  private calculateColor(count: number): string {
    const colors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'];
    if (count === 0) return colors[0];
    if (count < 5) return colors[1];
    if (count < 10) return colors[2];
    if (count < 15) return colors[3];
    return colors[4];
  }

  private calculateDaysInMonth(): { date: string; count: number }[][] {
    const months: { date: string; count: number }[][] = Array.from(
      { length: 12 },
      () => []
    );
    this.data.forEach((day) => {
      const date = new Date(day.date);
      months[date.getMonth()].push(day);
    });

    // Fill missing days with count 0
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        if (
          !months[monthIndex].find(
            (d) => new Date(d.date).getDay() === dayIndex
          )
        ) {
          const firstDayOfMonth = new Date(2023, monthIndex, 1);
          const date = new Date(
            firstDayOfMonth.setDate(
              firstDayOfMonth.getDate() +
                ((dayIndex - firstDayOfMonth.getDay() + 7) % 7)
            )
          );
          months[monthIndex].push({ date: date.toISOString(), count: 0 });
        }
      }
      months[monthIndex].sort(
        (a, b) => new Date(a.date).getDay() - new Date(b.date).getDay()
      );
    }
    return months;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const rect = this.heatmapCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.tooltipVisible = false;
    this.data.forEach((day) => {
      const date = new Date(day.date);
      const monthIndex = date.getMonth();
      const dayIndex = date.getDay();
      const cellX =
        monthIndex * (this.squareSize + this.padding) + this.squareSize;
      const cellY =
        dayIndex * (this.squareSize + this.padding) + this.squareSize;

      if (
        x >= cellX &&
        x <= cellX + this.squareSize &&
        y >= cellY &&
        y <= cellY + this.squareSize
      ) {
        this.tooltipVisible = true;
        this.tooltipText = `Intensity count: ${day.count} on ${day.date}`;
        this.tooltipX = event.clientX + 5;
        this.tooltipY = event.clientY + 5;
      }
    });
  }
}
