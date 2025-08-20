import re
import unicodedata

def normalize_location(location_name: str, address: str) -> str:
    """
    Tạo location_key chuẩn hóa để đảm bảo uniqueness
    Kết hợp location_name và address, loại bỏ dấu, khoảng trắng thừa, chuyển thường
    """
    # Kết hợp location name và address
    combined = f"{location_name.strip()} {address.strip()}"
    
    # Chuyển thành chữ thường
    combined = combined.lower()
    
    # Loại bỏ dấu tiếng Việt
    combined = unicodedata.normalize('NFD', combined)
    combined = ''.join(char for char in combined if unicodedata.category(char) != 'Mn')
    
    # Chỉ giữ lại chữ cái, số và khoảng trắng
    combined = re.sub(r'[^a-zA-Z0-9\s]', ' ', combined)
    
    # Loại bỏ khoảng trắng thừa và thay bằng underscore
    combined = re.sub(r'\s+', '_', combined.strip())
    
    return combined

def is_similar_location(location_key1: str, location_key2: str, threshold: float = 0.8) -> bool:
    """
    Kiểm tra xem hai location có tương tự nhau không
    Sử dụng Levenshtein distance
    """
    def levenshtein_distance(s1: str, s2: str) -> int:
        if len(s1) < len(s2):
            return levenshtein_distance(s2, s1)

        if len(s2) == 0:
            return len(s1)

        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    max_len = max(len(location_key1), len(location_key2))
    if max_len == 0:
        return True
    
    distance = levenshtein_distance(location_key1, location_key2)
    similarity = 1 - (distance / max_len)
    
    return similarity >= threshold 