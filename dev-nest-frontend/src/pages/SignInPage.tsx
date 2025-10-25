import AuthForm from './AuthForm'

const SignInPage = () => {
  return (
    <AuthForm
      mode="signin"
      title="로그인"
      description="테스트 계정 ID는 user001, 비밀번호는 1234입니다. 로그인하고 최신 기술 인사이트를 확인하세요."
      submitLabel="로그인"
      alternateLink={{
        text: '계정이 없다면?',
        to: '/signup',
      }}
    />
  )
}

export default SignInPage
