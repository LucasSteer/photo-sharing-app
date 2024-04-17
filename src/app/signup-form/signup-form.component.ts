import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatCardModule } from '@angular/material/card'; 

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCardModule],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.css'
})
export class SignupFormComponent {
  signupForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post(`/users`, this.signupForm.value).subscribe({next: (res: any) => {
      console.log(res.message);
      this.router.navigate(['/']);
    }, error: (err: any) => {
      console.error("Error: ", err);
    }});
  }
}