# Todo List

Todo API를 활용한 웹 기반 할 일 관리 앱입니다.  
회원가입과 로그인을 통해 인증하고, 개인 Todo를 등록·관리할 수 있습니다.

## 주요 기능

### 인증

- 회원가입 (아이디 4~20자 영문/숫자, 비밀번호 4~20자, 닉네임 2~20자)
- 로그인 / 로그아웃
- 새로고침 후에도 로그인 상태 유지 (localStorage 토큰 기반)

### Todo CRUD

- 할 일 추가 — 제목(필수), 설명, 우선순위(낮음/보통/높음), 마감일
- 할 일 수정 — 수정 모드 진입 후 저장
- 완료 토글 — 완료/미완료 상태 전환
- 삭제

### 필터

- 완료 상태별 필터 (전체 / 미완료 / 완료)
- 우선순위별 필터 (전체 / 높음 / 보통 / 낮음)

## 기술 스택

| 항목   | 내용                                  |
| ------ | ------------------------------------- |
| 번들러 | Vite                                  |
| 스타일 | Tailwind CSS v4                       |
| 언어   | Vanilla JavaScript (ES Modules)       |
| 인증   | JWT (Bearer Token, localStorage 저장) |

## 실행 방법

```bash
pnpm install
pnpm dev
```

## 프로젝트 구조

```
src/
  main.js
  style.css
  api/
    todoApi.js
  dom/
    elements.js
    renderTodos.js
  state/
    todoState.js
```

## API

베이스 URL: `https://api.fullstackfamily.com/api/edu/{slug}`

| 메서드 | 경로              | 설명                            |
| ------ | ----------------- | ------------------------------- |
| POST   | /auth/signup      | 회원가입                        |
| POST   | /auth/login       | 로그인                          |
| GET    | /auth/me          | 내 정보 조회                    |
| GET    | /todos            | Todo 목록 조회 (필터 쿼리 지원) |
| POST   | /todos            | Todo 생성                       |
| PUT    | /todos/:id        | Todo 수정                       |
| PATCH  | /todos/:id/toggle | 완료 토글                       |
| DELETE | /todos/:id        | Todo 삭제                       |

## 개발 참고

- 구현 가이드: [`docs/03-todo-api-webapp-guide.md`](docs/03-todo-api-webapp-guide.md)
