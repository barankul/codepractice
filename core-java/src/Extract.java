import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Extract {
    public static String firstCodeBlock(String text) {
        if (text == null) return null;

        Pattern p = Pattern.compile("```[a-zA-Z]*\\s*([\\s\\S]*?)```");
        Matcher m = p.matcher(text);
        if (!m.find()) return null;

        return m.group(1).trim();
    }
}
