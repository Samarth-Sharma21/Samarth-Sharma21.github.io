import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Send } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const ContactSection: React.FC = () => {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/Samarth-Sharma21',
      icon: <Github className='w-5 h-5' />,
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/samarth-sharma',
      icon: <Linkedin className='w-5 h-5' />,
    },
    {
      name: 'Email',
      url: 'https://mail.google.com/mail/?view=cm&fs=1&to=samarthsharma7621@gmail.com',
      icon: <Mail className='w-5 h-5' />,
    },
  ];

  const contactFormSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    message: Yup.string().required('Message is required'),
  });

  return (
    <section id='contact' className='section-padding'>
      <div className='container-custom'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}>
          <h2 className='text-text-light dark:text-text-dark font-clash font-bold'>
            Get In Touch
          </h2>
          <div className='w-20 h-1 bg-primary-light dark:bg-primary-dark mx-auto mt-4 rounded-full'></div>
          <p className='text-secondary-light dark:text-secondary-dark max-w-2xl mx-auto mt-6'>
            Have a project in mind or want to collaborate? Feel free to reach
            out to me. I'm always open to discussing new opportunities and
            ideas.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}>
            <h3 className='text-2xl font-clash font-semibold text-text-light dark:text-text-dark mb-6'>
              Contact Information
            </h3>

            <p className='text-secondary-light dark:text-secondary-dark mb-8'>
              Feel free to contact me through any of the following channels. I'm
              looking forward to hearing from you and discussing how we might
              work together.
            </p>

            <div className='space-y-6 mb-8'>
              <div>
                <h4 className='text-lg font-semibold text-text-light dark:text-text-dark mb-2'>
                  Email
                </h4>
                <p className='text-secondary-light dark:text-secondary-dark'>
                  samarthsharma7621@gmail.com
                </p>
              </div>

              <div>
                <h4 className='text-lg font-semibold text-text-light dark:text-text-dark mb-2'>
                  Location
                </h4>
                <p className='text-secondary-light dark:text-secondary-dark'>
                  Mumbai, India
                </p>
              </div>
            </div>

            <div>
              <h4 className='text-lg font-semibold text-text-light dark:text-text-dark mb-4'>
                Connect with me
              </h4>

              <div className='flex space-x-4'>
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={link.name}
                    className='p-3 rounded-full bg-white dark:bg-gray-800 text-primary-light dark:text-primary-dark shadow-md hover:shadow-lg transition-all duration-300'
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            <div className='card p-8'>
              <h3 className='text-2xl font-clash font-semibold text-text-light dark:text-text-dark mb-6'>
                Send Me a Message
              </h3>

              <Formik
                initialValues={{ name: '', email: '', message: '' }}
                validationSchema={contactFormSchema}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                  fetch(
                    'https://formsubmit.co/ajax/samarthsharma7621@gmail.com',
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                      },
                      body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        message: values.message,
                        _subject: 'New Portfolio Contact',
                        _captcha: 'false',
                        _template: 'table',
                        _next: window.location.href,
                      }),
                    }
                  )
                    .then((response) => {
                      if (response.ok) {
                        alert('Message sent successfully!');
                        resetForm();
                      } else {
                        alert('Failed to send message.');
                      }
                      setSubmitting(false);
                    })
                    .catch((error) => {
                      console.error('Error:', error);
                      alert('Something went wrong.');
                      setSubmitting(false);
                    });
                }}>
                {({ isSubmitting, touched, errors }) => (
                  <Form>
                    <div className='space-y-6'>
                      <div>
                        <Field
                          type='text'
                          name='name'
                          id='name'
                          placeholder='Your Name'
                          className={`block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-light dark:focus:border-primary-dark ${
                            touched.name && errors.name ? 'border-red-500' : ''
                          }`}
                        />
                        <ErrorMessage
                          name='name'
                          component='div'
                          className='text-red-500 text-sm mt-1'
                        />
                      </div>

                      <div>
                        <Field
                          type='email'
                          name='email'
                          id='email'
                          placeholder='Your Email'
                          className={`block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-light dark:focus:border-primary-dark ${
                            touched.email && errors.email
                              ? 'border-red-500'
                              : ''
                          }`}
                        />
                        <ErrorMessage
                          name='email'
                          component='div'
                          className='text-red-500 text-sm mt-1'
                        />
                      </div>

                      <div>
                        <Field
                          as='textarea'
                          name='message'
                          id='message'
                          rows={5}
                          placeholder='Your Message'
                          className={`block w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-lg focus:outline-none focus:border-primary-light dark:focus:border-primary-dark ${
                            touched.message && errors.message
                              ? 'border-red-500'
                              : ''
                          }`}
                        />
                        <ErrorMessage
                          name='message'
                          component='div'
                          className='text-red-500 text-sm mt-1'
                        />
                      </div>

                      <motion.button
                        type='submit'
                        disabled={isSubmitting}
                        className='btn btn-primary w-full flex items-center justify-center'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}>
                        <Send className='w-4 h-4 mr-2' />
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </motion.button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
