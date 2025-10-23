import AuthForm from './AuthForm'

const SignInPage = () => {
  return (
    <AuthForm
      title="로그인"
      description="DevNest 계정으로 로그인하고 최신 기술 인사이트를 확인하세요."
      submitLabel="로그인"
      alternateLink={{
        text: '계정이 없다면?',
        to: '/signup',
      }}
    />
  )
}

export default SignInPage
