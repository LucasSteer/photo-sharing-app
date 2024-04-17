import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post(`/login`, this.loginForm.value).subscribe({next: (res: any) => {
      console.log(res.message);
      this.router.navigate(['/']);
    }, error: (err: any) => {
      console.error("Error: ", err);
    }});
  }
}
