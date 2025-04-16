import { Footer } from '@/components';
import { login } from '@/services/user';
import useUserStore from '@/stores/user';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, history, useIntl } from '@umijs/max';
import { Alert, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { createStyles } from 'antd-style';
import { getToken } from '@/utils/auth';
import type { LoginParams } from '@/services/user';

const useStyles = createStyles(() => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      background: '#f0f2f5',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loginForm: {
      width: '508px',
      margin: '0 auto',
      padding: '24px',
      background: '#fff',
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'rgba(0, 0, 0, 0.85)',
      marginBottom: '12px',
    },
    subtitle: {
      fontSize: '14px',
      color: 'rgba(0, 0, 0, 0.45)',
    },
  };
});

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [loginError, setLoginError] = useState(false);
  const { setToken, setUserInfo } = useUserStore();
  const { styles } = useStyles();
  const intl = useIntl();

  // 检查登录状态，如果已登录则重定向到 dashboard
  useEffect(() => {
    const token = getToken();
    if (token) {
      history.replace('/');
    }
  }, []);

  const handleSubmit = async (values: LoginParams) => {
    try {
      const response = await login(values);
      if (response.code === 200 && response.data) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);

        // 保存用户数据到 store
        setToken(response.data.access_token);
        setUserInfo({
          ...response.data.user,
          access_token: response.data.access_token,
          token_type: response.data.token_type,
        });

        setLoginError(false);
        const urlParams = new URL(window.location.href).searchParams;
        const redirectPath = urlParams.get('redirect');
        // 如果有指定的重定向路径就用指定的，否则直接跳转到用户列表页面
        history.push(redirectPath || '/admin/users');
        return;
      }
      message.error(response.message || '登录失败');
      setLoginError(true);
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
      setLoginError(true);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{ flex: '1', padding: '32px 0', display: 'flex' }}>
        <div className={styles.loginForm} style={{ margin: 'auto' }}>
          <div className={styles.header}>
            <img alt="logo" src="/logo.svg" style={{ height: '44px', marginBottom: '20px' }} />
            <div className={styles.title}>Entity Sport OMS</div>
            <div className={styles.subtitle}>运营管理系统</div>
          </div>

          {loginError && (
            <LoginMessage
              content={intl.formatMessage({
                id: 'pages.login.accountLogin.errorMessage',
                defaultMessage: '账户或密码错误',
              })}
            />
          )}

          <LoginForm
            submitter={{
              searchConfig: {
                submitText: intl.formatMessage({
                  id: 'pages.login.submit',
                  defaultMessage: '登录',
                }),
              },
            }}
            onFinish={async (values) => {
              await handleSubmit(values as LoginParams);
            }}
          >
            <ProFormText
              name="phone"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.phone.placeholder',
                defaultMessage: '请输入手机号',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.phone.required"
                      defaultMessage="请输入手机号!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockOutlined />,
              }}
              placeholder={intl.formatMessage({
                id: 'pages.login.password.placeholder',
                defaultMessage: '请输入密码',
              })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="请输入密码！"
                    />
                  ),
                },
              ]}
            />
          </LoginForm>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
