import { Curation, ICuration } from '../models/curationModel';

// 큐레이션 리스트 조회 (필터링 및 검색)
export const getCurations = async (
  page: number, 
  filters: { style?: string; gender?: string; age?: string; searchQuery?: string; status?: string }
): Promise<ICuration[]> => {
  const pageSize = 10;
  const query: any = {};

  // 필터 값이 존재하고 '전체'가 아닐 경우에만 필터 조건에 추가
  if (filters.style && filters.style !== '전체') {
    query.styleFilter = filters.style;
  }
  if (filters.gender && filters.gender !== '전체') {
    query.genderFilter = filters.gender;
  }
  if (filters.age && filters.age !== '전체') {
    query.ageFilter = filters.age;
  }
  if (filters.status) {
    query.status = filters.status;
  }

  // 검색어가 있을 경우에만 검색 조건 추가
  if (filters.searchQuery) {
    query.$or = [
      { title: { $regex: filters.searchQuery, $options: 'i' } },
      { content: { $regex: filters.searchQuery, $options: 'i' } }
    ];
  }

  const curations = await Curation.find(query)
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return curations;
};

// 특정 큐레이션 상세 조회
export const getCurationById = async (curationId: string): Promise<ICuration | null> => {
  return await Curation.findById(curationId);
};

// 큐레이션 생성 (관리자만 가능)
export const createCuration = async (curationData: Partial<ICuration>): Promise<ICuration> => {
    const newCuration = new Curation(curationData);
    return await newCuration.save(); // DB에 저장
  };