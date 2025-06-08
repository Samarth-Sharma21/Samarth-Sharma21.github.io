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
      url: 'https://linkedin.com/in/samarth-sh',
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

  const handleSubmit = async (
    values: { name: string; email: string; message: string },
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    const createToast = (message: string, isSuccess: boolean) => {
      // Remove any existing toast
      const existingToast = document.getElementById('form-toast');
      if (existingToast) {
        existingToast.remove();
      }

      // Create new toast
      const toast = document.createElement('div');
      toast.id = 'form-toast';
      toast.className = `fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ${
        isSuccess
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`;
      toast.style.opacity = '0';

      // Add icon based on status
      const icon = document.createElement('span');
      icon.innerHTML = isSuccess
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

      // Add message
      const text = document.createElement('span');
      text.textContent = message;

      toast.appendChild(icon);
      toast.appendChild(text);
      document.body.appendChild(toast);

      // Animate in
      setTimeout(() => {
        toast.style.opacity = '1';
      }, 10);

      // Animate out after delay
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toast.remove();
        }, 200);
      }, 4000);
    };

    try {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('message', values.message);
      formData.append('_subject', 'New Contact from Portfolio');
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_replyto', values.email);

      const response = await fetch(
        'https://formsubmit.co/samarthsharma7621@gmail.com',
        {
          method: 'POST',
          ...(isMobile
            ? {
                body: formData,
                mode: 'no-cors' as RequestMode,
              }
            : {
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                },
                body: JSON.stringify({
                  ...values,
                  _subject: 'New Contact from Portfolio',
                  _captcha: 'false',
                  _template: 'table',
                  _replyto: values.email,
                }),
              })
        }
      );

      if (isMobile || response.ok) {
        createToast(
          "Your message has been received — I’ll get back to you at the earliest.",
          true
        );
        resetForm();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      createToast('Failed to send message. Please try again.', false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section 
      id='contact' 
      className='section-padding select-none'
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-200px" }}
      transition={{ duration: 0.8 }}
    >
      <div className='container-custom'>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}>
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
                onSubmit={handleSubmit}
              >
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
    </motion.section>
  );
};

export default ContactSection;
