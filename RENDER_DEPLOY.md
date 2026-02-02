# Render 배포 가이드

이 가이드는 백엔드 서버를 [Render](https://render.com)에 배포하는 방법을 설명합니다.

## 1. Render 가입 및 준비

1. [Render.com](https://render.com)에 접속하여 회원가입 또는 로그인을 합니다.
2. GitHub 계정으로 가입하면 리포지토리를 쉽게 연결할 수 있습니다.

## 2. 데이터베이스 (MongoDB) 준비

기존에 사용하던 MongoDB Atlas 접속 정보(`MONGODB_URI`)를 준비해둡니다.
형식: `mongodb+srv://<username>:<password>@cluster...`

## 3. Blueprint를 이용한 자동 배포 (추천)

이 프로젝트에는 `render.yaml` 파일이 포함되어 있어 설정을 자동으로 불러올 수 있습니다.

1. Render 대시보드에서 **New +** 버튼을 클릭하고 **Blueprint**를 선택합니다.
2. 배포할 GitHub 리포지토리(`camping-go`)를 연결합니다.
3. `Service Name`에 `camping-server`라고 자동으로 뜰 것입니다.
4. **Apply**를 누르기 전에, 환경 변수 설정을 확인해야 할 수도 있습니다. (Blueprint 방식은 환경변수를 미리 입력받기도 합니다.)
   - 만약 입력창이 안 뜬다면, 서비스 생성 후 **Environment** 탭에서 설정해야 합니다.

## 4. 수동으로 Web Service 생성 (대안)

Blueprint가 잘 안되거나 수동으로 하고 싶다면:

1. Render 대시보드에서 **New +** -> **Web Service** 선택.
2. GitHub 리포지토리 연결.
3. 설정 입력:
   - **Name**: `camping-server` (원하는 이름)
   - **Root Directory**: `server` (중요! 백엔드 코드가 server 폴더 안에 있음)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: `Free`

4. **Advanced** 버튼을 눌러 환경 변수 추가:
   - `MONGODB_URI`: (준비한 MongoDB 접속 주소)
   - `JWT_SECRET`: (사용할 비밀 키, 예: `my_super_secret_key`)
   - `NODE_VERSION`: `18.17.0` (권장)

5. **Create Web Service** 클릭.

## 5. 배포 확인

1. 배포가 시작되면 로그(Logs) 탭에서 진행 상황을 볼 수 있습니다.
2. `Build successful` 및 `Server is running...` 메시지가 뜨면 성공입니다.
3. 상단에 있는 URL (예: `https://camping-server-xxxx.onrender.com`)이 백엔드 주소입니다.
4. 이 주소로 접속해서 `Hello! Camping Server is running correctly.` 메시지가 나오는지 확인하세요.

## 6. 클라이언트(프론트엔드) 연결

백엔드 배포가 완료되면, 프론트엔드에서 이 백엔드를 바라보도록 설정해야 합니다.

1. Netlify 등 프론트엔드 배포 설정으로 이동합니다.
2. 환경 변수 `VITE_API_BASE`를 방금 생성된 Render 백엔드 주소로 변경합니다.
   - 예: `https://camping-server-xxxx.onrender.com` (뒤에 `/api`는 코드에서 자동 처리하므로 생략 가능하지만, `https://.../api` 형태로 넣어도 됨)
3. 프론트엔드를 다시 배포(Re-deploy)합니다.
