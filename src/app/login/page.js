'use client';
import React, { useState } from 'react';

import '../../styles/page.css';

import { Glow, Form, Input, Redirector, Button } from '@/components';
import { checkError } from '@/utils/ErrorHandler';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasError = checkError([
      {
        condition:
          !email ||
          email.trim().length === 0 ||
          !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/.test(email.trim()),
        message: 'Please enter a valid email.',
      },
      {
        condition: !password || password.length < 6,
        message: 'Please enter a password with a minimum length of 6 characters',
      },
    ]);
    if (hasError) return;

    await login({ email, password });
  };

  return (
    <div className="page">
      <Glow />
      <Form title="Welcome back 👋" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          autocomplete="email"
          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
          value={email}
          setValue={setEmail}
        />
        <Input type="password" placeholder="Password" value={password} setValue={setPassword} />
        <Redirector text="New around here? Sign up instead" href="/signup" />
        <Button type="submit" text="Login" />
      </Form>
    </div>
  );
};

export default Login;
