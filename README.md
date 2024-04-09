# 프로젝트 소개
- 한 줄 소개: NestJS를 이용하여 Trello와 같은 칸반 보드 서비스를 위한 API 서버를 제작.
- 배경: NestJS는 규모가 크고 복잡한 프로젝트에 적합한 프레임워크. 이를 직접 느껴보기 위해 칸반 보드 서비스를 위한 API서버를 제작.
- 프로젝트 인원: 5명
- 진행 기간: 7일

# 👨‍💻 팀원

<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/choisooyoung-dev"><img src="https://avatars.githubusercontent.com/u/108859974?v=4" width="100px;" alt=""/><br /><sub><b> 팀장 : 최수영 </b></sub></a><br /></td>
      <td align="center"><a href=https://github.com/smy1308"><img src="https://avatars.githubusercontent.com/u/146905861?v=4" width="100px;" alt=""/><br /><sub><b> 팀원 : 손민영 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/visitor17564"><img src="https://avatars.githubusercontent.com/u/146846913?v=4" width="100px;" alt=""/><br /><sub><b> 팀원 : 정창일 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/sangkwonlee1722"><img src="https://avatars.githubusercontent.com/u/147799382?v=4" width="100px;" alt=""/><br /><sub><b> 팀원 : 이상권 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/wlals7565"><img src="https://avatars.githubusercontent.com/u/117993640?v=4" width="100px;" alt=""/><br /><sub><b> 팀원 : 이정훈 </b></sub></a><br /></td>
    </tr>
  </tbody>
</table>

## 👥 팀 구성원 및 역할

- **손민영**

  - 댓글 담당

- **정창일**

  - 와이어프레임 설계
  - 리스트, 체크리스트 담당

- **이상권**

  - 보드 담당

- **이정훈**

  - 회원, 인증 담당
  - ERD 설계
  - Swagger 문서 작성

- **최수영**

  - 카드 담당

## ✅ 기술 스택

<!-- 프로젝트에 사용된 기술 스택을 나열 -->
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white)
![Nest.js](https://img.shields.io/badge/nest.js-E0234E?style=for-the-badge&logo=Nest.js.js&logoColor=white)
![TypeORM](https://img.shields.io/badge/typeorm-262627?style=for-the-badge&logo=typeorm&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

## 🗃 ERD

![ERD](image.png)

# 프로젝트 과정 소개
<table>
<thead>
<tr>
<th align="left"><strong>기간</strong></th>
<th align="left"><strong>작업</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td align="left">ERD설계</td>
<td align="left">
  <ul>
    <li>
      칸반 보드 서비스의 ERD를 설계하기 위해 직접 Trello를 써보면서 필요한 데이터들을 정리
    </li>
    <li>
      이후 검토를 거쳐 정말 필요한 필드로 구성된 테이블 구조 설정
    </li>
  </ul>
  </td>
</tr>
  <tr>
<td align="left">API 설계 및 제작</td>
<td align="left">
  <ul>
    <li>
      제작된 ERD를 기준으로 필요한 API설계
    </li>
    <li>
      API 설계 과정에서 사용자들이 서로의 칸반 보드를 건들지 못하게 해야할 필요성을 느낌
    </li>
    <li>
      이에 따라 JWT토큰을 이용하여 유저가 인증되어야 칸반 보드를 조작할 수 있게 인증 기능을 구현
    </li>
  </ul>
  </td>
</tr>
   <tr>
<td align="left">API 검증을 위한 Swagger 문서 작성</td>
<td align="left">
  <ul>
    <li>
      백엔드만 존재하다 보니 이를 검증할 수 있는 도구가 필요함을 느낌.
    </li>
    <li>
      이에 따라 Swagger를 이용하여 API를 문서화하고 테스트 함.
    </li>
  </ul>
  </td>
</tr>
</tbody>
</table>
