import { Routes } from '@angular/router';
import { SignupFormComponent } from './signup-form/signup-form.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

export const routes: Routes = [
  {
    path: 'signup',
    component: SignupFormComponent
  },
  {
    path: 'login',
    component: LoginFormComponent
  },
  {
    path: 'profile',
    component: ProfilePageComponent
  }
];
