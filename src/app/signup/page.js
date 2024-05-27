'use client';
import React, { useState } from 'react';

import '../../styles/page.css';

import { Glow, Form, Input, Redirector, Button } from '@/components';
import { checkError } from '@/utils/ErrorHandler';
import { useAuth } from '../../contexts/AuthContext';

const SignUp = () => {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasError = checkError([
      {
        condition: !name || name.trim().length === 0,
        message: 'Please enter your name.',
      },
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
      {
        condition: !confirmPassword || password !== confirmPassword,
        message: 'Confirm password does not match.',
      },
    ]);
    if (hasError) return;

    await signup({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <div className="page">
      <Glow />
      <Form title="Join the future of advertising now 🚀" onSubmit={handleSubmit}>
        <Input type="text" placeholder="Name" autocomplete="name" value={name} setValue={setName} />
        <Input
          type="email"
          placeholder="Email"
          autocomplete="email"
          pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
          value={email}
          setValue={setEmail}
        />
        <Input type="password" placeholder="Password" value={password} setValue={setPassword} />
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          setValue={setConfirmPassword}
        />
        <Redirector text="Already have an account? Log in instead" href="/login" />
        <Button type="submit" text="Sign up" />
      </Form>
    </div>
  );
};

export default SignUp;
