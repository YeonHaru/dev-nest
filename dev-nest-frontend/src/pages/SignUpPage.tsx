import AuthForm from './AuthForm'

const SignUpPage = () => {
  return (
    <AuthForm
      title="회원가입"
      description="DevNest 회원가입으로 기술 블로그를 시작해 보세요."
      submitLabel="회원가입"
      showConfirmPassword
      alternateLink={{
        text: '이미 계정이 있다면?',
        to: '/signin',
      }}
    />
  )
}

export default SignUpPage
