# GPS 자재 관리 시스템

이 프로젝트는 라즈베리 파이를 이용한 GPS 위치 추적 클라이언트와 이를 수집하고 시각화하는 서버 및 웹 애플리케이션으로 구성되어 있습니다. 자체 지도 서버(Tileserver-GL)를 운영하여 오프라인 환경에서도 지도를 서비스할 수 있습니다.

## 📂 프로젝트 구조

```bash
src/
├── client/          # Frontend React 애플리케이션
├── gps/             # 라즈베리 파이용 Python GPS 클라이언트
├── server/          # Node.js 백엔드 서버 (API & DB)
tilserver/           # 지도 타일 서버 (Tileserver-GL)
fonts/               # 지도용 폰트 생성 도구
start_servers.sh     # 전체 서버 실행 스크립트
```

## 🚀 설치 및 실행

### 1. 필수 요구 사항
- **Node.js** (v18 이상 권장)
- **Python 3** (클라이언트 실행 시)
- **MySQL** (백엔드 데이터베이스)
  - 로컬에 MySQL이 설치되어 실행 중이어야 합니다.
  - 기본 설정: ID `root`, PW `root` (변경 시 `src/server/server.js` 수정)

### 2. 실행 방법
프로젝트 루트에서 `start_servers.sh` 스크립트를 실행하면 지도 서버와 백엔드 서버가 동시에 실행됩니다.

```bash
./start_servers.sh
```

- **웹 서비스**: `http://localhost:8080`
- **지도 서버**: `http://localhost:9999`

---

## 🛠 구성 요소 상세

### 1. GPS 클라이언트 (`src/gps/`)
라즈베리 파이에서 실행되며, LTE 모듈을 통해 GPS 좌표를 수집하여 서버로 전송합니다.
- **client.py**: 메인 실행 파일.
- **config.txt**: 클라이언트 설정 파일.
  - 1행: 클라이언트 버전
  - 2행: 타입
  - 3행: 이름
  - 4행: 서버 주소 (ngrok 등 사용 시 주소 변경 필요)

> **LTE 모듈 주의사항**: Sixfab LTE 모듈을 사용 중이며, 데이터 비용 절감을 위해 평소에는 꺼두시기 바랍니다. 시연 등 필요 시 활성화가 필요합니다.

### 2. 백엔드 서버 (`src/server/`)
Node.js Express 기반의 서버입니다.
- **기능**:
  - GPS 데이터 수신 및 MySQL 저장
  - React 프론트엔드 정적 파일 서빙
  - 클라이언트 설정 및 상태 관리 API 제공
- **데이터베이스**: 최초 실행 시 `gps_service` DB와 테이블(`gps`, `module`)을 자동으로 생성합니다.

### 3. 프론트엔드 (`src/client/`)
React 기반의 웹 대시보드입니다.
- 실시간 위치 모니터링 및 기기 관리 기능을 제공합니다.
- 빌드된 파일은 백엔드 서버를 통해 `http://localhost:8080`에서 서비스됩니다.

### 4. 지도 서버 (`tilserver/`)
[TileServer-GL](https://github.com/maptiler/tileserver-gl)을 사용하여 벡터/래스터 지도를 제공합니다.
- 포트: `9999`
- 데이터: `tilserver/tileserver-gl/file3.mbtiles` (대한민국 지역 데이터 포함)
- 폰트: `tilserver/tileserver-gl/fonts/` (한글 폰트 포함)

---

## ⚠️ 주의사항

1. **서버 주소 동기화**:
   - `ngrok` 등을 사용하여 외부에서 접속할 경우, URL이 변경될 때마다 다음 파일들을 수정해야 합니다.
     - `src/gps/config.txt` (클라이언트 설정)
     - `src/client/src/config.js` (프론트엔드 설정 - 있는 경우)

2. **데이터베이스**:
   - MySQL 접속 정보가 변경되면 `src/server/server.js` 파일의 DB 설정을 수정하세요.
