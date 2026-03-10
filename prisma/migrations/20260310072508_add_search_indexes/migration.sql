-- pg_trgm 확장 설치 (trigram 검색)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- tags 배열 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_image_tags ON "Image" USING GIN (tags);

-- colorTags 배열 GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_image_color_tags ON "Image" USING GIN ("colorTags");

-- Full-Text Search용 tsvector 컬럼 추가
ALTER TABLE "Image" ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- search_vector GIN 인덱스
CREATE INDEX IF NOT EXISTS idx_image_search_vector ON "Image" USING GIN (search_vector);

-- search_vector 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_image_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'simple',
    coalesce(NEW.name, '') || ' ' || coalesce(NEW.description, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- search_vector 트리거 (INSERT/UPDATE 시 자동 갱신)
DROP TRIGGER IF EXISTS trg_image_search_vector ON "Image";
CREATE TRIGGER trg_image_search_vector
  BEFORE INSERT OR UPDATE ON "Image"
  FOR EACH ROW
  EXECUTE FUNCTION update_image_search_vector();
