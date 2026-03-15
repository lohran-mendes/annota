import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExamService } from './exam.service';
import type {
  Exam,
  ExamSubject,
  Question,
  ApiListResponse,
  ApiResponse,
  CreateExamDto,
  UpdateExamDto,
  LinkQuestionsDto,
} from '@annota/shared';

// --- Fixtures ---

const mockExam: Exam = {
  id: 'exam-1',
  name: 'Vestibulinho ETEC 2025',
  description: 'Prova de ingresso ETEC',
  year: 2025,
  institution: 'ETEC',
  questionIds: ['q-1', 'q-2'],
  questionCount: 2,
  subjectCount: 3,
  duration: 150,
};

const mockExamList: ApiListResponse<Exam> = {
  data: [mockExam],
  total: 1,
};

const mockExamResponse: ApiResponse<Exam> = { data: mockExam };

const mockCreateDto: CreateExamDto = {
  name: 'ENEM 2025',
  description: 'Exame Nacional do Ensino Medio',
  year: 2025,
  institution: 'INEP',
  duration: 300,
};

const mockUpdateDto: UpdateExamDto = { name: 'ENEM 2025 - Atualizado' };

const mockExamSubjectList: ApiListResponse<ExamSubject> = {
  data: [
    {
      id: 'subj-1',
      name: 'Matematica',
      icon: 'calculate',
      color: '#4caf50',
      questionCount: 10,
      topics: [],
    },
  ],
  total: 1,
};

const mockQuestionList: ApiListResponse<Question> = {
  data: [
    {
      id: 'q-1',
      topicId: 'topic-1',
      subjectId: 'subj-1',
      statement: 'Quanto e 2+2?',
      alternatives: [
        { label: 'A', text: '3' },
        { label: 'B', text: '4' },
      ],
      correctAnswerIndex: 1,
      explanation: 'Soma basica.',
    },
  ],
  total: 1,
};

// --- Tests ---

describe('ExamService', () => {
  let service: ExamService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ExamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- getAll() ---

  describe('getAll()', () => {
    it('should send GET to /exams', () => {
      service.getAll().subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams') && !r.url.includes('/exams/'));
      expect(req.request.method).toBe('GET');
      req.flush(mockExamList);
    });

    it('should return the exam list from the API', () => {
      let result: ApiListResponse<Exam> | undefined;
      service.getAll().subscribe(res => { result = res; });

      const req = httpMock.expectOne(r => r.url.endsWith('/exams'));
      req.flush(mockExamList);

      expect(result).toEqual(mockExamList);
      expect(result?.data).toHaveLength(1);
      expect(result?.total).toBe(1);
    });
  });

  // --- getById() ---

  describe('getById()', () => {
    it('should send GET to /exams/:id', () => {
      service.getById('exam-1').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockExamResponse);
    });

    it('should return the correct exam data', () => {
      let result: ApiResponse<Exam> | undefined;
      service.getById('exam-1').subscribe(res => { result = res; });

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1'));
      req.flush(mockExamResponse);

      expect(result?.data).toEqual(mockExam);
      expect(result?.data.id).toBe('exam-1');
    });
  });

  // --- create() ---

  describe('create()', () => {
    it('should send POST to /exams with the DTO in the body', () => {
      service.create(mockCreateDto).subscribe();

      const req = httpMock.expectOne(r => r.url.endsWith('/exams'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCreateDto);
      req.flush({ data: { ...mockExam, name: mockCreateDto.name } } satisfies ApiResponse<Exam>);
    });

    it('should return the created exam', () => {
      const createdExam: Exam = { ...mockExam, id: 'exam-new', name: mockCreateDto.name };
      let result: ApiResponse<Exam> | undefined;

      service.create(mockCreateDto).subscribe(res => { result = res; });

      const req = httpMock.expectOne(r => r.url.endsWith('/exams'));
      req.flush({ data: createdExam } satisfies ApiResponse<Exam>);

      expect(result?.data.name).toBe(mockCreateDto.name);
    });
  });

  // --- update() ---

  describe('update()', () => {
    it('should send PUT to /exams/:id with the DTO in the body', () => {
      service.update('exam-1', mockUpdateDto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1'));
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockUpdateDto);
      req.flush({ data: { ...mockExam, ...mockUpdateDto } } satisfies ApiResponse<Exam>);
    });
  });

  // --- delete() ---

  describe('delete()', () => {
    it('should send DELETE to /exams/:id', () => {
      service.delete('exam-1').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1'));
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });

  // --- getExamSubjects() ---

  describe('getExamSubjects()', () => {
    it('should send GET to /exams/:examId/subjects', () => {
      service.getExamSubjects('exam-1').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1/subjects'));
      expect(req.request.method).toBe('GET');
      req.flush(mockExamSubjectList);
    });

    it('should return the list of subjects for the exam', () => {
      let result: ApiListResponse<ExamSubject> | undefined;
      service.getExamSubjects('exam-1').subscribe(res => { result = res; });

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1/subjects'));
      req.flush(mockExamSubjectList);

      expect(result?.data).toHaveLength(1);
      expect(result?.data[0].name).toBe('Matematica');
    });
  });

  // --- getExamQuestions() ---

  describe('getExamQuestions()', () => {
    it('should send GET to /exams/:examId/questions', () => {
      service.getExamQuestions('exam-1').subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1/questions'));
      expect(req.request.method).toBe('GET');
      req.flush(mockQuestionList);
    });

    it('should return the list of questions for the exam', () => {
      let result: ApiListResponse<Question> | undefined;
      service.getExamQuestions('exam-1').subscribe(res => { result = res; });

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1/questions'));
      req.flush(mockQuestionList);

      expect(result?.data).toHaveLength(1);
      expect(result?.data[0].id).toBe('q-1');
    });
  });

  // --- linkQuestions() ---

  describe('linkQuestions()', () => {
    it('should send POST to /exams/:examId/questions/link', () => {
      const dto: LinkQuestionsDto = { questionIds: ['q-3'] };
      service.linkQuestions('exam-1', dto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1/questions/link'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockExamResponse);
    });
  });

  // --- unlinkQuestions() ---

  describe('unlinkQuestions()', () => {
    it('should send POST to /exams/:examId/questions/unlink', () => {
      const dto: LinkQuestionsDto = { questionIds: ['q-1'] };
      service.unlinkQuestions('exam-1', dto).subscribe();

      const req = httpMock.expectOne(r => r.url.includes('/exams/exam-1/questions/unlink'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockExamResponse);
    });
  });
});
