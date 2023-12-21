import React, { Component, Fragment } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';  

import Layout from './components/Layout/Layout';
import Backdrop from './components/Backdrop/Backdrop';
import Toolbar from './components/Toolbar/Toolbar';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import ErrorHandler from './components/ErrorHandler/ErrorHandler';
import TodoPage from './pages/Todo/Todos';
import SinglePostPage from './pages/Todo/SingleTodo/SingleTodo';
import LoginPage from './pages/Auth/Login';
import SignupPage from './pages/Auth/Signup';
import './App.css';

const apiUrl = process.env.REACT_APP_API_URL;
console.log(process.env);

class App extends Component {
  state = {
    showBackdrop: false,
    showMobileNav: false,
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    error: null,
    creator:localStorage.getItem('creator')
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    const expiryDate = localStorage.getItem('expiryDate');
    if (!token || !expiryDate) {
      return;
    }
    if (new Date(expiryDate) <= new Date()) {
      this.logoutHandler();
      return;
    }
    const userId = localStorage.getItem('userId');
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.setState({ isAuth: true, token: token, userId: userId });
    this.setAutoLogout(remainingMilliseconds);
  }

  mobileNavHandler = isOpen => {
    this.setState({ showMobileNav: isOpen, showBackdrop: isOpen });
  };

  backdropClickHandler = () => {
    this.setState({ showBackdrop: false, showMobileNav: false, error: null });
  };

  logoutHandler = () => {
    this.setState({ isAuth: false, token: null });
    localStorage.removeItem('token');
    localStorage.removeItem('expiryDate');
    localStorage.removeItem('userId');
    localStorage.removeItem('creator');
  };

  loginHandler = (event, authData) => {
    event.preventDefault();
    let errorMessages = [];
    try{
      // if (authData.email === '' && authData.password === '') {
      //   errorMessages.push('Please enter your login credential!');
      // }  
      if (authData.email === '') {
        errorMessages.push('Please enter email id!');
      }
      if (authData.password === '') {
        errorMessages.push('Please enter your password!');
      }
      if (errorMessages.length > 0) {
        throw new Error(errorMessages);
      }
    }
    catch(err) {
      this.setState({
        isAuth: false,
        authLoading: false,
        error: err
      });
    }
    if(authData.email !== '' && authData.password !== ''){
      this.setState({ authLoading: true });
      fetch(`${apiUrl}/auth/login`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json'//It won't work with file upload
        },
        body:JSON.stringify({
          email: authData.email,
          password: authData.password,
        })
      })
      .then(res => {
        console.log(res);
        if (res.status === 422) {
          throw new Error('Validation failed.');
        }
        if (res.status !== 200 && res.status !== 201) {
          console.log('Error!');
          throw new Error('Please enter correct login credential!');
        }
        return res.json();
      })
      .then(resData => {
        console.log(`creator`+resData.userName); 
        localStorage.setItem('creator', resData.userName);
        this.setState({
          isAuth: true,
          token: resData.token,
          authLoading: false,
          userId: resData.userId,
          creator:localStorage.getItem('creator')
        });
        localStorage.setItem('token', resData.token);
        localStorage.setItem('userId', resData.userId);
        const remainingMilliseconds = 60 * 60 * 1000;
        const expiryDate = new Date(
          new Date().getTime() + remainingMilliseconds
        );
        localStorage.setItem('expiryDate', expiryDate.toISOString());
        this.setAutoLogout(remainingMilliseconds);
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isAuth: false,
          authLoading: false,
          error: err
        });
      });
    }
  };

  signupHandler = (event, authData) => {
    event.preventDefault();
    let isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(authData.signupForm.password.value);
    let errorMessages = [];

    try { 
      if (authData.signupForm.email.value === '') {
        errorMessages.push('Please enter your email!');
      }
      if (authData.signupForm.name.value === '') {
        errorMessages.push('Please enter your first name!');
      }
      if (authData.signupForm.password.value === '') {
        errorMessages.push('Please create your password!');
      }
      if(!isValid){
        errorMessages.push('Password must be at least 8 characters long with at least 1 uppercase and lowercase letter and 1 digit');
      }
  
      // let isValid = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(authData.signupForm.password.value);
      // if (authData.signupForm.email.value !== '' && !isValid) {
      //   errorMessages.push('Please create a strong password');
      // }
  
      if (errorMessages.length > 0) {
        throw new Error(errorMessages);
      }
    } catch (err) {
      // console.log(err);
      this.setState({
        isAuth: false,
        authLoading: false,
        error: err,
      });
    }
  
    if (errorMessages.length === 0) {
      this.setState({ authLoading: true });
      fetch(`${apiUrl}/auth/signup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json', //It won't work with file upload
        },
        body: JSON.stringify({
          email: authData.signupForm.email.value,
          name: authData.signupForm.name.value,
          password: authData.signupForm.password.value,
        }),
      })
        .then((res) => {
          // console.log(res);
          // if (res.status === 422) {
          //   throw new Error('Email already exists!');
          // }
          // if (res.status !== 200 && res.status !== 201) {
          //   console.log('Error!');
          //   throw new Error('Creating a user failed!');
          // }
          return res.json();
        })
        .then((resData) => {
          console.log(resData); 
          // console.log(resData.data);
          try{
            if (resData.data) {
              errorMessages.push(resData.data[0].msg);
              throw new Error(errorMessages);
            }
          }catch (err) {
            // console.log(err);
            this.setState({
              isAuth: false,
              authLoading: false,
              error: err,
            });
          }
          if (!resData.data) {
            this.setState({ isAuth: false, authLoading: false });
            this.props.history.replace('/'); 
          }
        })
        .catch((err) => {
          console.log(err.message);
          this.setState({
            isAuth: false,
            authLoading: false,
            error: err.message,
          });
        });
    }
  };
  

  setAutoLogout = milliseconds => {
    setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  render() {
    let routes = (
      <Switch>
        <Route
          path="/"
          exact
          render={props => (
            <LoginPage
              {...props}
              onLogin={this.loginHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Route
          path="/signup"
          exact
          render={props => (
            <SignupPage
              {...props}
              onSignup={this.signupHandler}
              loading={this.state.authLoading}
            />
          )}
        />
        <Redirect to="/" />
      </Switch>
    );
    if (this.state.isAuth) {
      routes = (
        <Switch>
          <Route
            path="/"
            exact
            render={props => (
              <TodoPage userId={this.state.userId} token={this.state.token} />
            )}
          />
          <Route
            path="/:postId"
            render={props => (
              <SinglePostPage
                {...props}
                userId={this.state.userId}
                token={this.state.token}
              />
            )}
          />
          <Redirect to="/" />
        </Switch>
      );
    }
    return (
      <Fragment>
        {this.state.showBackdrop && (
          <Backdrop onClick={this.backdropClickHandler} />
        )}
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onOpenMobileNav={this.mobileNavHandler.bind(this, true)}
                onLogout={this.logoutHandler}
                isAuth={this.state.isAuth}
                creator={this.state.creator}
              />
            </Toolbar>
          }
          mobileNav={
            <MobileNavigation
              open={this.state.showMobileNav}
              mobile
              onChooseItem={this.mobileNavHandler.bind(this, false)}
              onLogout={this.logoutHandler}
              isAuth={this.state.isAuth} 
              creator={this.state.creator}
            />
          }
        />
        {routes}
      </Fragment>
    );
  }
}

export default withRouter(App);  
