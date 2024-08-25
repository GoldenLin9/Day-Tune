import styles from './AuthInput.module.css';

interface AuthInputProps {
    imageType: string;
    type: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AuthInput = ({ imageType, type, name, placeholder, value, onChange}: AuthInputProps) => {

    let imageClassName;
    switch (imageType) {
        case "user":
            imageClassName = `${styles.userImage}`;
            break;
        case "password":
            imageClassName = `${styles.passwordImage}`;
            break;
        case "email":
            imageClassName = `${styles.emailImage}`;
            break;
    }


    return (
        <input


            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`${styles.authInput} ${imageClassName}`} 
        />
    );
};

export default AuthInput;